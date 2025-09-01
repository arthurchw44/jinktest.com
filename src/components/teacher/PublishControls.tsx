import React, { useState } from 'react';
import { useUpdateArticleStatus } from '../../hooks/useArticles';
import { useAudioStatus } from '../../hooks/useAudioStatus';
import type { IArticle } from '../../types/article.types';

interface PublishControlsProps {
  article: IArticle;
  onStatusChange?: () => void;
}

const PublishControls: React.FC<PublishControlsProps> = ({ article, onStatusChange }) => {
  const [showConfirm, setShowConfirm] = useState<'publish' | 'unpublish' | null>(null);
  const updateStatusMutation = useUpdateArticleStatus();
  const { data: audioStatus } = useAudioStatus(article.articleName, true);

  // FIXED: Audio availability check (not status-based)
  const hasAudio = audioStatus?.audio?.hasAudio || 
                   (audioStatus?.audio?.totalFragments ?? 0) > 0 || 
                   Boolean(article.fullAudioUrl);

  // FIXED: Clear status logic
  const isEditing = article.status === 'editing';
  const isProcessing = article.status === 'processing';
  const isPublished = article.status === 'ready'; // ONLY means published for students
  const isError = article.status === 'error';

  // UPDATED: Publishing rules with clear flow
  // - Can publish: editing status AND has audio AND not processing
  // - Can unpublish: currently published (ready status)
  const canPublish = isEditing && hasAudio && !updateStatusMutation.isPending;
  const canUnpublish = isPublished && !updateStatusMutation.isPending;

  const handlePublish = async () => {
    try {
      await updateStatusMutation.mutateAsync({
        articleName: article.articleName,
        status: 'ready', // Publish = set to ready
      });
      setShowConfirm(null);
      onStatusChange?.();
    } catch (error) {
      console.error('Publishing failed:', error);
    }
  };

  const handleUnpublish = async () => {
    try {
      await updateStatusMutation.mutateAsync({
        articleName: article.articleName,
        status: 'editing', // Unpublish = back to editing
      });
      setShowConfirm(null);
      onStatusChange?.();
    } catch (error) {
      console.error('Unpublishing failed:', error);
    }
  };

  // Helper function for button tooltip
  const getPublishTooltip = () => {
    if (isProcessing) return 'Audio is still processing';
    if (!hasAudio) return 'Generate audio first';
    if (isError) return 'Fix audio generation errors first';
    return undefined;
  };

  return (
    <div className="space-y-2">
      {/* UPDATED: Status Indicator with clearer labels */}
      <div className={`text-xs px-2 py-1 rounded-full text-center font-medium ${
        isPublished ? 'bg-green-100 text-green-800' :
        isProcessing ? 'bg-blue-100 text-blue-800' :
        isError ? 'bg-red-100 text-red-800' :
        hasAudio ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
      }`}>
        {isPublished ? '🎯 Published for Students' :
         isProcessing ? '🔄 Generating Audio...' :
         isError ? '❌ Generation Failed' :
         hasAudio ? '✅ Ready to Publish' : '📝 Draft'
        }
      </div>

      {/* Error Message */}
      {isError && article.processingError && (
        <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
          Error: {article.processingError}
        </div>
      )}

      {/* Publish Button - Only for editing articles with audio */}
      {!isPublished && (
        <button
          onClick={() => setShowConfirm('publish')}
          disabled={!canPublish}
          className={`w-full px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            canPublish
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          title={getPublishTooltip()}
        >
          {updateStatusMutation.isPending ? 'Publishing...' : '🎯 Publish for Students'}
        </button>
      )}

      {/* Unpublish Button - Only for published articles */}
      {isPublished && (
        <button
          onClick={() => setShowConfirm('unpublish')}
          disabled={!canUnpublish}
          className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm font-medium transition-colors disabled:opacity-60"
        >
          {updateStatusMutation.isPending ? 'Unpublishing...' : '📝 Unpublish & Edit'}
        </button>
      )}

      {/* Preview Button - Only for published articles */}
      {isPublished && (
        <a
          href={`/student/practice/${article.articleName}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full px-4 py-2 border border-blue-300 text-blue-700 rounded-md hover:bg-blue-50 text-sm font-medium text-center transition-colors"
        >
          👁️ Preview Student Experience
        </a>
      )}

      {/* UPDATED: Audio Ready Indicator - For editing articles with audio */}
      {isEditing && hasAudio && (
        <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
          ✅ Audio generated successfully. Click publish to make available to students.
        </div>
      )}

      {/* ADDED: No Audio Warning - For editing articles without audio */}
      {isEditing && !hasAudio && !isProcessing && (
        <div className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
          ⚠️ Generate audio before publishing for students.
        </div>
      )}

      {/* Confirmation Modals */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">
              {showConfirm === 'publish' ? '🎯 Publish Article' : '📝 Unpublish Article'}
            </h3>
            <p className="text-gray-600 mb-6">
              {showConfirm === 'publish'
                ? `Publish "${article.title}" for student practice? Students will be able to access this article immediately.`
                : `Unpublish "${article.title}" and return to editing? Students will no longer be able to access this article.`}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={showConfirm === 'publish' ? handlePublish : handleUnpublish}
                disabled={updateStatusMutation.isPending}
                className={`px-4 py-2 text-white rounded-md disabled:opacity-50 ${
                  showConfirm === 'publish'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                {showConfirm === 'publish' ? 'Publish' : 'Unpublish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublishControls;
