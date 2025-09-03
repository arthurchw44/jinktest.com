import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useArticle } from '../../hooks/useArticles';
import { useAudioStatus } from '../../hooks/useAudioStatus';
import { 
  useForceRegenerateAudio,
  useAdminUpdateArticleStatus,
  useAdminDeleteArticle
} from '../../hooks/useAdminArticles';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

const AdminArticleDetail: React.FC = () => {
  const { articleName } = useParams<{ articleName: string }>();
  const navigate = useNavigate();
  
  const { data: article, isLoading: articleLoading, error: articleError } = useArticle(articleName!);
  const { data: audioStatus, isLoading: audioLoading } = useAudioStatus(articleName!, true);
  
  const forceRegenerate = useForceRegenerateAudio();
  const updateStatus = useAdminUpdateArticleStatus();
  const deleteArticle = useAdminDeleteArticle();

  const [deleteDialog, setDeleteDialog] = useState(false);
  const [regenerateDialog, setRegenerateDialog] = useState(false);

  if (!articleName) {
    return <div>Invalid article name</div>;
  }

  if (articleLoading || audioLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner message="Loading article details..." />
      </div>
    );
  }

  if (articleError || !article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Article Not Found</h2>
          <p className="text-gray-600 mb-4">The requested article could not be found.</p>
          <Link 
            to="/admin/articles" 
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Articles
          </Link>
        </div>
      </div>
    );
  }

  const handleStatusToggle = async () => {
    const newStatus = article.status === 'ready' ? 'editing' : 'ready';
    try {
      await updateStatus.mutateAsync({ articleName, status: newStatus });
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleForceRegenerate = async () => {
    try {
      await forceRegenerate.mutateAsync({ articleName, quality: 'high' });
      setRegenerateDialog(false);
    } catch (error) {
      console.error('Failed to regenerate audio:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteArticle.mutateAsync(articleName);
      navigate('/admin/articles');
    } catch (error) {
      console.error('Failed to delete article:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'editing': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <Link to="/admin/articles" className="hover:text-gray-700">Articles</Link>
            <span>/</span>
            <span className="text-gray-900">{article.title}</span>
          </nav>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{article.title}</h1>
              <p className="text-gray-600 mt-2">
                Created by {article.teacherUsername} • {article.sentences.length} sentences
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(article.status)}`}>
                {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Article Info */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Article Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Article Name</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono bg-gray-50 px-3 py-2 rounded">
                    {article.articleName}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Teacher</label>
                  <p className="mt-1 text-sm text-gray-900">{article.teacherUsername}</p>
                </div>
                
                {article.metadata?.grade && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Grade</label>
                    <p className="mt-1 text-sm text-gray-900">{article.metadata.grade}</p>
                  </div>
                )}
                
                {article.metadata?.subject && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                    <p className="mt-1 text-sm text-gray-900">{article.metadata.subject}</p>
                  </div>
                )}
                
                {article.metadata?.difficulty && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Difficulty</label>
                    <p className="mt-1 text-sm text-gray-900">{article.metadata.difficulty}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Audio Status */}
            {audioStatus && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Audio Status</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Audio Generation</p>
                      <p className="text-sm text-gray-600">
                        {audioStatus.audio.hasAudio ? 'Audio files available' : 'No audio generated'}
                      </p>
                    </div>
                    <div className="flex items-center">
                      {audioStatus.audio.hasAudio ? (
                        <div className="flex items-center text-green-600">
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                          </svg>
                          Available
                        </div>
                      ) : (
                        <div className="flex items-center text-gray-400">
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd"/>
                            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/>
                          </svg>
                          Not Available
                        </div>
                      )}
                    </div>
                  </div>

                  {audioStatus.audio.totalFragments && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Total Fragments:</span>
                        <span className="ml-2 font-medium">{audioStatus.audio.totalFragments}</span>
                      </div>
                      {audioStatus.audio.totalDuration && (
                        <div>
                          <span className="text-gray-600">Duration:</span>
                          <span className="ml-2 font-medium">{Math.round(audioStatus.audio.totalDuration)}s</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Article Text Preview */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Article Preview</h2>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {article.originalText}
                </p>
              </div>
            </div>
          </div>

          {/* Admin Actions Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Admin Actions</h2>
              
              <div className="space-y-3">
                <button
                  onClick={handleStatusToggle}
                  disabled={article.status === 'processing' || updateStatus.isPending}
                  className={`w-full px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    article.status === 'ready' 
                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {updateStatus.isPending ? 'Updating...' : 
                   article.status === 'ready' ? 'Unpublish Article' : 'Publish Article'}
                </button>

                <button
                  onClick={() => setRegenerateDialog(true)}
                  disabled={article.status === 'processing' || forceRegenerate.isPending}
                  className="w-full px-4 py-2 bg-purple-100 text-purple-800 hover:bg-purple-200 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {forceRegenerate.isPending ? 'Regenerating...' : 'Force Regenerate Audio'}
                </button>

                <Link
                  to={`/teacher/articles/${articleName}/edit`}
                  className="w-full px-4 py-2 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded-md text-sm font-medium transition-colors text-center block"
                >
                  Edit Article
                </Link>

                <button
                  onClick={() => setDeleteDialog(true)}
                  className="w-full px-4 py-2 bg-red-100 text-red-800 hover:bg-red-200 rounded-md text-sm font-medium transition-colors"
                >
                  Delete Article
                </button>
              </div>
            </div>

            {/* Error Information */}
            {article.processingError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-red-800 mb-2">Processing Error</h3>
                <p className="text-sm text-red-700">{article.processingError}</p>
              </div>
            )}

            {/* Article Stats */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Statistics</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Word Count:</span>
                  <span className="font-medium">{article.originalText.split(' ').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sentences:</span>
                  <span className="font-medium">{article.sentences.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">{new Date(article.createdAt!).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Updated:</span>
                  <span className="font-medium">{new Date(article.updatedAt!).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Dialogs */}
        <ConfirmDialog
          isOpen={regenerateDialog}
          title="Force Regenerate Audio"
          message="This will regenerate all audio files for this article. The process may take several minutes. Continue?"
          confirmText="Regenerate"
          cancelText="Cancel"
          type="warning"
          onConfirm={handleForceRegenerate}
          onCancel={() => setRegenerateDialog(false)}
        />

        <ConfirmDialog
          isOpen={deleteDialog}
          title="Delete Article"
          message={`Are you sure you want to delete "${article.title}"? This action cannot be undone and will remove all associated audio files.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          onConfirm={handleDelete}
          onCancel={() => setDeleteDialog(false)}
        />
      </div>
    </div>
  );
};

export default AdminArticleDetail;
