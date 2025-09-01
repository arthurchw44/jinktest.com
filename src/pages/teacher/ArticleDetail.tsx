// src/pages/teacher/ArticleDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useArticle, useDeleteArticle } from '../../hooks/useArticles';
import  SentencePreview  from '../../components/articles/SentencePreview';
import type { IArticle, ISentence } from '../../types/article.types';
// import type { FragmentTiming } from '../../types/article.types';

import { useAudioStatus } from '../../hooks/useAudioStatus';
import { useMutation } from '@tanstack/react-query';
import { apiGenerateAudio } from '../../api/apiArticles';

import { useQueryClient } from '@tanstack/react-query';
import PublishControls from '../../components/teacher/PublishControls';


const ArticleDetail: React.FC = () => {
  const { articleName } = useParams<{ articleName: string }>();
  const navigate = useNavigate();
  const { data: article, isLoading, error } = useArticle(articleName!);
  const deleteArticleMutation = useDeleteArticle();
  
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const queryClient = useQueryClient();
  // const convertSentencesToFragmentTiming = (sentences: ISentence[]): FragmentTiming[] => {
  //   return sentences.map((sentence, index) => ({
  //     fragmentIndex: index,
  //     order: sentence.order,
  //     text: sentence.text,
  //     startTime: sentence.startTime || 0,
  //     endTime: sentence.endTime || 0,
  //     duration: (sentence.endTime || 0) - (sentence.startTime || 0),
  //     wordCount: sentence.wordCount
  //   }));
  // };

  const handleDelete = async () => {
    if (!article) return;
    
    try {
      await deleteArticleMutation.mutateAsync(article.articleName);
      navigate('/teacher/articles');
    } catch (error) {
      console.error('Failed to delete article:', error);
      alert('Failed to delete article. Please try again.');
    }
  };

// Update the status display function to use strict typing
  const getStatusDisplay = (status: IArticle['status']) => {
    const statusConfig: Record<IArticle['status'], {
      bg: string
      text: string
      icon: string
      label: string
      description: string
    }> = {
      editing: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800', 
        icon: '✏️',
        label: 'Editing',
        description: 'Article is being edited and not ready for students yet.'
      },
      processing: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        icon: '⚙️', 
        label: 'Processing',
        description: 'Audio files are being generated. This may take a few minutes.'
      },
      ready: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: '✅',
        label: 'Ready', 
        description: 'Article is complete and ready for student dictation exercises.'
      },
      error: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: '❌',
        label: 'Error',
        description: 'There was an error processing this article.'
      }
    }
    
    return statusConfig[status]
  }




  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading article...</span>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">Article not found</div>
          <Link
            to="/teacher/articles"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Articles
          </Link>
        </div>
      </div>
    );
  }

  const statusDisplay = getStatusDisplay(article.status);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Link
              to="/teacher/articles"
              className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
            >
              ← Back to Articles
            </Link>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {article.title}
          </h1>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="font-mono bg-gray-100 px-3 py-1 rounded">
              {article.articleName}
            </span>
            <span>By {article.teacherUsername}</span>
            <span>Created {formatDate(article.createdAt)}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {article.status === 'editing' && (
            <Link
              to={`/teacher/articles/${article.articleName}/edit`}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Edit Article
            </Link>
          )}
          
          <button
            onClick={() => setDeleteConfirm(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {/* ADD THE AUDIO STATUS PANEL */}
      <AudioStatusPanel article={article} />

      {/* Status Card */}
      <div className={`p-4 rounded-lg border ${statusDisplay.bg} ${statusDisplay.text}`}>
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{statusDisplay.icon}</span>
          <div>
            <div className="font-semibold">{statusDisplay.label}</div>
            <div className="text-sm opacity-90">{statusDisplay.description}</div>
            {article.processingError && (
              <div className="text-sm mt-1 font-mono bg-white bg-opacity-50 p-2 rounded">
                Error: {article.processingError}
              </div>
            )}
            
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Article Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Metadata */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold mb-4">Article Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Grade Level</label>
                <div className="mt-1 text-sm text-gray-900">
                  {article.metadata?.grade || 'Not specified'}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Subject</label>
                <div className="mt-1 text-sm text-gray-900">
                  {article.metadata?.subject || 'Not specified'}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Difficulty Level</label>
                <div className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {article.metadata?.difficulty || 'Not specified'}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Estimated Time</label>
                <div className="mt-1 text-sm text-gray-900">
                  {article.metadata?.estimatedTime ? `${article.metadata.estimatedTime} minutes` : 'Auto-calculated'}
                </div>
              </div>
            </div>
          </div>

          {/* Original Text */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold mb-4">Original Text</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {article.originalText}
              </p>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {article.originalText.length} characters, {article.originalText.split(/\s+/).length} words
            </div>
          </div>

          {/* Sentences */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold mb-4">
              Sentences ({article.sentences.length})
            </h3>
            <SentencePreview
              sentences={article.sentences.map((s:ISentence) => s.text)}
              articleName={article.articleName}
              showSentenceIds={true}
              editable={false}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold mb-4">Statistics</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Sentences:</span>
                <span className="text-sm font-medium">{article.sentences.length}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Words/Sentence:</span>
                <span className="text-sm font-medium">
                  {Math.round(article.sentences.reduce((sum:number, s:ISentence) => sum + s.wordCount, 0) / article.sentences.length) || 0}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Long Sentences:</span>
                <span className="text-sm font-medium text-yellow-600">
                  {article.sentences.filter((s:ISentence) => s.isLong).length}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Ready Sentences:</span>
                <span className="text-sm font-medium text-green-600">
                  {article.sentences.filter((s:ISentence) => s.status === 'ready').length}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Has Audio:</span>
                <span className="text-sm font-medium">
                  {article.sentences.filter((s:ISentence) => s.individualAudioUrl).length}
                </span>
              </div>
            </div>
          </div>

          {/* Audio Files */}
          {article.fullAudioUrl && (
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold mb-4">Audio Files</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Full Article Audio:</label>
                  <div className="mt-1">
                    <audio controls className="w-full">
                      <source src={article.fullAudioUrl} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold mb-4">Actions</h3>
            
            <div className="space-y-3">
              {article.status === 'ready' && (
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Start Dictation Exercise
                </button>
              )}
              
              {article.status === 'editing' && (
                <Link
                  to={`/teacher/articles/${article.articleName}/edit`}
                  className="block w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center"
                >
                  Continue Editing
                </Link>
              )}
              
              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-lg font-semibold mb-4">Publishing</h3>
                <PublishControls 
                  article={article}
                  onStatusChange={() => {
                    // Optionally refresh data
                    queryClient.invalidateQueries({ queryKey: ['article', article.articleName] });
                  }}
                />
              </div>

              <button
                onClick={() => navigator.clipboard.writeText(article.articleName)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Copy Article Name
              </button>
              
              <button
                onClick={() => setDeleteConfirm(true)}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Article
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Delete Article</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "{article.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={deleteArticleMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                disabled={deleteArticleMutation.isPending}
              >
                {deleteArticleMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleDetail;


// const AudioStatusPanel: React.FC<{ article: IArticle }> = ({ article }) => {
//   const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
//   const generateAudioMutation = useMutation({
//     mutationFn: (articleName: string) => apiGenerateAudio(articleName),
//   });

//   const queryClient = useQueryClient();

//   // This is where we USE the hook with real-time updates
//   const { 
//     data: audioStatus, 
//     // isLoading, 
//     error, 
//     dataUpdatedAt,
//     isRefetching 
//   } = useAudioStatus(
//     article.articleName, 
//     article.status === 'processing' || article.status === 'ready'
//   );

//   // Track when data updates to show real-time feedback
//   useEffect(() => {
//     if (dataUpdatedAt > lastUpdate.getTime()) {
//       setLastUpdate(new Date(dataUpdatedAt));
//     }
//   }, [dataUpdatedAt, lastUpdate]);

//   const handleGenerateAudio = async () => {
//     try {
//       await generateAudioMutation.mutateAsync(article.articleName);
//       // This will trigger the polling via the hook

//       queryClient.setQueryData<IArticle>(['article', article.articleName], 
//         prev => prev ? {...prev, status: 'processing', processingError: undefined} : prev);

//       queryClient.invalidateQueries({ queryKey: ['article', article.articleName] });

//     } catch (error) {
//       console.error('Failed to start audio generation:', error);
//     }
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-sm border p-6">
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-lg font-semibold">Audio Status</h3>
        
//         {/* REAL-TIME UPDATE INDICATOR */}
//         {isRefetching && (
//           <div className="flex items-center text-blue-600 text-sm">
//             <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
//             Checking status...
//           </div>
//         )}
//       </div>

//       {/* STATUS DISPLAY WITH REAL-TIME UPDATES */}
//       <div className="space-y-4">
        
//         {/* EDITING STATE */}
//         {article.status === 'editing' && (
//           <div className="space-y-3">
//             <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
//               <div className="text-yellow-600 mr-3">⚠️</div>
//               <div>
//                 <p className="font-medium text-yellow-800">Ready to Generate Audio</p>
//                 <p className="text-sm text-yellow-700">Click below to create audio for student practice</p>
//               </div>
//             </div>
            
//             <button
//               onClick={handleGenerateAudio}
//               disabled={generateAudioMutation.isPending}
//               className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
//             >
//               {generateAudioMutation.isPending ? (
//                 <>
//                   <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
//                   Starting Generation...
//                 </>
//               ) : (
//                 'Generate Audio'
//               )}
//             </button>
//           </div>
//         )}

//         {/* PROCESSING STATE - REAL-TIME UPDATES */}
//         {article.status === 'processing' && (
//           <div className="space-y-3">
//             <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
//               <div className="text-blue-600 mr-3">
//                 <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
//               </div>
//               <div className="flex-1">
//                 <p className="font-medium text-blue-800">Generating Audio</p>
//                 <p className="text-sm text-blue-700">
//                   This usually takes 2-3 minutes. Status updates automatically.
//                 </p>
//               </div>
//             </div>
            
//             {/* REAL-TIME STATUS DETAILS */}
//             {audioStatus && (
//               <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Last checked:</span>
//                   <span className="font-mono">{lastUpdate.toLocaleTimeString()}</span>
//                 </div>
//                 {audioStatus.audio?.totalFragments && (
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Fragments:</span>
//                     <span>{audioStatus.audio.totalFragments}</span>
//                   </div>
//                 )}
//               </div>
//             )}
            
//             {/* PROGRESS INDICATOR */}
//             <div className="w-full bg-gray-200 rounded-full h-2">
//               <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
//             </div>
//           </div>
//         )}

//         {/* READY STATE - SUCCESS */}
//         {article.status === 'ready' && audioStatus && (
//           <div className="space-y-3">
//             <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
//               <div className="text-green-600 mr-3">✅</div>
//               <div>
//                 <p className="font-medium text-green-800">Audio Ready</p>
//                 <p className="text-sm text-green-700">Students can now practice this article</p>
//               </div>
//             </div>
            
//             {/* AUDIO PREVIEW */}
//             {audioStatus.audio?.fullAudioUrl && (
//               <div className="space-y-2">
//                 <label className="text-sm font-medium text-gray-700">Preview Audio:</label>
//                 <audio 
//                   controls 
//                   className="w-full" 
//                   src={audioStatus.audio.fullAudioUrl}
//                   preload="metadata"
//                 >
//                   Your browser does not support audio playback.
//                 </audio>
                
//                 <div className="flex justify-between text-xs text-gray-500">
//                   <span>Duration: {audioStatus.audio.totalDuration}s</span>
//                   <span>Fragments: {audioStatus.audio.totalFragments}</span>
//                   <span>Size: {Math.round((audioStatus.audio.audioSize || 0) / 1024)} KB</span>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}

//         {/* ERROR STATE - DETAILED ERROR HANDLING */}
//         {(article.status === 'error' || error) && (
//           <div className="space-y-3">
//             <div className="flex items-start p-3 bg-red-50 border border-red-200 rounded-lg">
//               <div className="text-red-600 mr-3 mt-0.5">❌</div>
//               <div className="flex-1">
//                 <p className="font-medium text-red-800">Audio Generation Failed</p>
//                 <p className="text-sm text-red-700 mt-1">
//                   {article.processingError || error?.message || 'Unknown error occurred'}
//                 </p>
//               </div>
//             </div>
            
//             {/* RETRY BUTTON */}
//             <button
//               onClick={handleGenerateAudio}
//               disabled={generateAudioMutation.isPending}
//               className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
//             >
//               Try Again
//             </button>
            
//             {/* NETWORK ERROR SPECIFIC HANDLING */}
//             {error && (
//               <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
//                 <p><strong>Debug Info:</strong></p>
//                 <p>Error: {error.message}</p>
//                 <p>Last attempt: {lastUpdate.toLocaleTimeString()}</p>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };


const AudioStatusPanel: React.FC<{ article: IArticle }> = ({ article }) => {
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const generateAudioMutation = useMutation({
    mutationFn: (articleName: string) => apiGenerateAudio(articleName),
  });

  const queryClient = useQueryClient();

  // Real-time audio status monitoring
  const { 
    data: audioStatus, 
    error, 
    dataUpdatedAt,
    isRefetching 
  } = useAudioStatus(
    article.articleName, 
    article.status === 'processing' || article.status === 'ready'
  );

  // Track data updates for real-time feedback
  useEffect(() => {
    if (dataUpdatedAt > lastUpdate.getTime()) {
      setLastUpdate(new Date(dataUpdatedAt));
    }
  }, [dataUpdatedAt, lastUpdate]);

  // FIXED: Audio availability detection (not status-based)
  const hasAudio = audioStatus?.audio?.hasAudio || 
                   audioStatus?.audio?.totalFragments? audioStatus?.audio?.totalFragments:0 > 0 || 
                   Boolean(article.fullAudioUrl);

  // FIXED: Clear status logic
  const isEditing = article.status === 'editing';
  const isProcessing = article.status === 'processing';  
  const isPublished = article.status === 'ready'; // ONLY means published
  const isError = article.status === 'error';

  // FIXED: UI state logic
  const canGenerateAudio = isEditing && !hasAudio && !isProcessing;
  const hasAudioButNotPublished = isEditing && hasAudio && !isProcessing;
  const isPublishedForStudents = isPublished;

  const handleGenerateAudio = async () => {
    try {
      await generateAudioMutation.mutateAsync(article.articleName);
      
      // Update local cache to show processing state immediately
      queryClient.setQueryData<IArticle>(['article', article.articleName], 
        prev => prev ? {...prev, status: 'processing', processingError: undefined} : prev);

      queryClient.invalidateQueries({ queryKey: ['article', article.articleName] });
    } catch (error) {
      console.error('Failed to start audio generation:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Audio Status</h3>
        
        {/* Real-time update indicator */}
        {isRefetching && (
          <div className="flex items-center text-blue-600 text-sm">
            <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
            Checking status...
          </div>
        )}
      </div>

      <div className="space-y-4">
        
        {/* EDITING STATE - NO AUDIO */}
        {canGenerateAudio && (
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-yellow-600 mr-3">📝</div>
              <div>
                <p className="font-medium text-yellow-800">Ready to Generate Audio</p>
                <p className="text-sm text-yellow-700">Click below to create audio for student practice</p>
              </div>
            </div>
            
            <button
              onClick={handleGenerateAudio}
              disabled={generateAudioMutation.isPending}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {generateAudioMutation.isPending ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Starting Generation...
                </>
              ) : (
                'Generate Audio'
              )}
            </button>
          </div>
        )}

        {/* PROCESSING STATE - REAL-TIME UPDATES */}
        {isProcessing && (
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-blue-600 mr-3">
                <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              </div>
              <div className="flex-1">
                <p className="font-medium text-blue-800">Generating Audio</p>
                <p className="text-sm text-blue-700">
                  This usually takes 2-3 minutes. Status updates automatically.
                </p>
              </div>
            </div>
            
            {/* Real-time status details */}
            {audioStatus && (
              <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Last checked:</span>
                  <span className="font-mono">{lastUpdate.toLocaleTimeString()}</span>
                </div>
                {audioStatus.audio?.totalFragments && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fragments:</span>
                    <span>{audioStatus.audio.totalFragments}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Progress indicator */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        )}

        {/* EDITING STATE - HAS AUDIO (READY TO PUBLISH) */}
        {hasAudioButNotPublished && (
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-green-600 mr-3">✅</div>
              <div>
                <p className="font-medium text-green-800">Audio Generated Successfully</p>
                <p className="text-sm text-green-700">Review the audio and publish when ready for students</p>
              </div>
            </div>
            
            {/* Audio preview */}
            {(audioStatus?.audio?.fullAudioUrl || article.fullAudioUrl) && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Preview Audio:</label>
                <audio 
                  controls 
                  className="w-full" 
                  src={audioStatus?.audio?.fullAudioUrl || article.fullAudioUrl!}
                  preload="metadata"
                >
                  Your browser does not support audio playback.
                </audio>
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Duration: {audioStatus?.audio?.totalDuration || 'N/A'}s</span>
                  <span>Fragments: {audioStatus?.audio?.totalFragments || article.sentences.length}</span>
                  <span>Size: {Math.round((audioStatus?.audio?.audioSize || 0) / 1024)} KB</span>
                </div>
              </div>
            )}

            {/* Regenerate option */}
            <div className="flex space-x-2">
              <button
                onClick={handleGenerateAudio}
                disabled={generateAudioMutation.isPending}
                className="flex-1 px-3 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 disabled:opacity-50 text-sm"
              >
                Regenerate Audio
              </button>
            </div>
          </div>
        )}

        {/* PUBLISHED STATE - FOR STUDENTS */}
        {isPublishedForStudents && (
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-blue-600 mr-3">🎯</div>
              <div>
                <p className="font-medium text-blue-800">Published for Students</p>
                <p className="text-sm text-blue-700">Students can now access and practice this article</p>
              </div>
            </div>
            
            {/* Published audio info */}
            {(audioStatus?.audio?.fullAudioUrl || article.fullAudioUrl) && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Published Audio:</label>
                <audio 
                  controls 
                  className="w-full" 
                  src={audioStatus?.audio?.fullAudioUrl || article.fullAudioUrl!}
                  preload="metadata"
                >
                  Your browser does not support audio playback.
                </audio>
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Duration: {audioStatus?.audio?.totalDuration || 'N/A'}s</span>
                  <span>Fragments: {audioStatus?.audio?.totalFragments || article.sentences.length}</span>
                  <span>Available to students</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ERROR STATE - DETAILED ERROR HANDLING */}
        {(isError || error) && (
          <div className="space-y-3">
            <div className="flex items-start p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-red-600 mr-3 mt-0.5">❌</div>
              <div className="flex-1">
                <p className="font-medium text-red-800">Audio Generation Failed</p>
                <p className="text-sm text-red-700 mt-1">
                  {article.processingError || error?.message || 'Unknown error occurred'}
                </p>
              </div>
            </div>
            
            {/* Retry button */}
            <button
              onClick={handleGenerateAudio}
              disabled={generateAudioMutation.isPending}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              Try Again
            </button>
            
            {/* Debug info for errors */}
            {error && (
              <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                <p><strong>Debug Info:</strong></p>
                <p>Error: {error.message}</p>
                <p>Last attempt: {lastUpdate.toLocaleTimeString()}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


