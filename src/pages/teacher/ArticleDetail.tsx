// src/pages/teacher/ArticleDetail.tsx
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useArticle, useDeleteArticle } from '../../hooks/useArticles';
import { SentencePreview } from '../../components/articles/SentencePreview';
import type { IArticle } from '../../types/article.types';

const ArticleDetail: React.FC = () => {
  const { articleName } = useParams<{ articleName: string }>();
  const navigate = useNavigate();
  const { data: article, isLoading, error } = useArticle(articleName!);
  const deleteArticleMutation = useDeleteArticle();
  
  const [deleteConfirm, setDeleteConfirm] = useState(false);

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

  const getStatusDisplay = (status: IArticle['status']) => {
    const statusConfig = {
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
        icon: '⚡',
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
    };
    
    return statusConfig[status];
  };

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
                  {article.metadata.grade || 'Not specified'}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Subject</label>
                <div className="mt-1 text-sm text-gray-900">
                  {article.metadata.subject || 'Not specified'}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Difficulty Level</label>
                <div className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {article.metadata.difficulty || 'Not specified'}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Estimated Time</label>
                <div className="mt-1 text-sm text-gray-900">
                  {article.metadata.estimatedTime ? `${article.metadata.estimatedTime} minutes` : 'Auto-calculated'}
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
              sentences={article.sentences.map(s => s.text)}
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
                  {Math.round(article.sentences.reduce((sum, s) => sum + s.wordCount, 0) / article.sentences.length) || 0}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Long Sentences:</span>
                <span className="text-sm font-medium text-yellow-600">
                  {article.sentences.filter(s => s.isLong).length}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Ready Sentences:</span>
                <span className="text-sm font-medium text-green-600">
                  {article.sentences.filter(s => s.status === 'ready').length}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Has Audio:</span>
                <span className="text-sm font-medium">
                  {article.sentences.filter(s => s.individualAudioUrl).length}
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