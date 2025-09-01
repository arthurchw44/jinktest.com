// src/pages/teacher/ArticleList.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useArticles, useDeleteArticle, useArticleStats } from '../../hooks/useArticles';
import type { IArticle } from '../../types/article.types';
import PublishControls from '../../components/teacher/PublishControls';
import { useQueryClient } from '@tanstack/react-query';

const ArticleList: React.FC = () => {
  // const navigate = useNavigate();
  const { data: articles, isLoading, error, refetch } = useArticles();
  const { data: stats } = useArticleStats();
  const deleteArticleMutation = useDeleteArticle();
  const queryClient = useQueryClient();
  
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    article: IArticle | null;
  }>({ isOpen: false, article: null });

  const handleDeleteClick = (article: IArticle) => {
    setDeleteConfirm({ isOpen: true, article });
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirm.article) {
      try {
        await deleteArticleMutation.mutateAsync(deleteConfirm.article.articleName);
        setDeleteConfirm({ isOpen: false, article: null });
        refetch();
      } catch (error) {
        console.error('Failed to delete article:', error);
        alert('Failed to delete article. Please try again.');
      }
    }
  };

  const getStatusBadge = (status: IArticle['status']) => {
    const statusConfig = {
      editing: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Editing' },
      processing: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Processing' },
      ready: { bg: 'bg-green-100', text: 'text-green-800', label: 'Ready' },
      error: { bg: 'bg-red-100', text: 'text-red-800', label: 'Error' }
    };
    
    const config = statusConfig[status];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading articles...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">Failed to load articles</div>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Articles</h1>
          <p className="text-gray-600 mt-1">Manage your dictation exercises</p>
        </div>
        
        <Link
          to="/teacher/articles/create"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Article
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Articles</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-green-600">{stats.byStatus.ready || 0}</div>
            <div className="text-sm text-gray-600">Ready</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-yellow-600">{stats.byStatus.editing || 0}</div>
            <div className="text-sm text-gray-600">Editing</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-blue-600">{stats.byStatus.processing || 0}</div>
            <div className="text-sm text-gray-600">Processing</div>
          </div>
        </div>
      )}

      {/* Articles List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {!articles || articles.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-medium">No articles yet</p>
              <p className="text-sm">Create your first dictation exercise to get started</p>
            </div>
            <Link
              to="/teacher/articles/create"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create First Article
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Article
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {articles.map((article:IArticle) => (
                  <tr key={article.articleName} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {article.title}
                        </div>
                        <div className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block">
                          {article.articleName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>{article.sentences.length} sentences</div>
                        <div className="text-xs text-gray-500">
                          {article.metadata?.grade && `${article.metadata.grade} • `}
                          {article.metadata?.subject && `${article.metadata.subject} • `}
                          {article.metadata?.difficulty}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(article.status)}
                      {article.processingError && (
                        <div className="text-xs text-red-600 mt-1" title={article.processingError}>
                          Error occurred
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(article.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/teacher/articles/${article.articleName}`}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          View
                        </Link>
                        {article.status === 'editing' && (
                          <Link
                            to={`/teacher/articles/${article.articleName}/edit`}
                            className="text-green-600 hover:text-green-800 transition-colors"
                          >
                            Edit
                          </Link>
                        )}
                        <button
                          onClick={() => handleDeleteClick(article)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          Delete
                        </button>
                        <div className="mt-4">
                          <PublishControls 
                            article={article}
                            onStatusChange={() => {
                              // Refresh the articles list
                              queryClient.invalidateQueries({ queryKey: ['articles'] });
                            }}
                          />
                        </div>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Delete Article</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "{deleteConfirm.article?.title}"? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setDeleteConfirm({ isOpen: false, article: null })}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={deleteArticleMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
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

export default ArticleList;