// src/pages/student/ArticleList.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useArticles } from '../../hooks/useArticles';
import { useDictationProgress } from '../../hooks/useDictationProgress';
import {LoadingSpinner} from '../../components/common/LoadingSpinner';

interface ArticleCardProps {
  article: any;
  progress?: any;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, progress }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'a1': return 'bg-green-100 text-green-800';
      case 'a2': return 'bg-blue-100 text-blue-800';
      case 'b1': return 'bg-yellow-100 text-yellow-800';
      case 'b2': return 'bg-orange-100 text-orange-800';
      case 'c1': return 'bg-red-100 text-red-800';
      case 'c2': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDisplay = () => {
    if (article.status !== 'ready') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Processing Audio...
        </span>
      );
    }

    if (progress?.isCompleted) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          ✓ Completed
        </span>
      );
    }

    if (progress && progress.session.completedFragments > 0) {
      const completionRate = (progress.session.completedFragments / progress.session.fragments.length);
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {Math.round(completionRate * 100)}% Complete
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Not Started
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {article.title}
          </h3>
          <div className="ml-2 flex-shrink-0">
            {getStatusDisplay()}
          </div>
        </div>

        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
          {article.originalText.substring(0, 120)}...
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {article.metadata?.difficulty && (
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(article.metadata.difficulty)}`}>
                {article.metadata.difficulty}
              </span>
            )}
            
            <span className="text-xs text-gray-500">
              {article.sentences?.length || 0} fragments
            </span>
            
            {article.metadata?.estimatedTime && (
              <span className="text-xs text-gray-500">
                ~{article.metadata.estimatedTime} min
              </span>
            )}
          </div>

          {article.metadata?.subject && (
            <span className="text-xs text-gray-500">
              {article.metadata.subject}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Created: {new Date(article.createdAt).toLocaleDateString()}
          </div>

          <Link
            to={`/student/practice/${article.articleName}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              article.status === 'ready'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {progress?.isCompleted ? 'Practice Again' : progress?.session ? 'Continue' : 'Start Practice'}
          </Link>
        </div>
      </div>
    </div>
  );
};

const StudentArticleList: React.FC = () => {
  const { data: articles, isLoading, error } = useArticles();
  const { getAllSessions } = useDictationProgress(''); // Get all sessions for progress info

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Loading available articles..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Error Loading Articles</h2>
          <p className="text-gray-600">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  const readyArticles = articles?.filter(article => article.status === 'ready') || [];
  const processingArticles = articles?.filter(article => article.status !== 'ready') || [];
  const allSessions = getAllSessions();
  const sessionsMap = new Map(allSessions.map(s => [s.session.articleName, s]));

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dictation Practice</h1>
        <p className="text-gray-600">
          Choose an article to practice your listening and typing skills
        </p>
      </div>

      {/* Ready Articles */}
      {readyArticles.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Available for Practice</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {readyArticles.map((article) => (
              <ArticleCard
                key={article.articleName}
                article={article}
                progress={sessionsMap.get(article.articleName)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Processing Articles */}
      {processingArticles.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Coming Soon</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processingArticles.map((article) => (
              <ArticleCard
                key={article.articleName}
                article={article}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!articles || articles.length === 0) && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Articles Available</h3>
          <p className="text-gray-600">
            Your teacher hasn't published any dictation exercises yet. Check back later!
          </p>
        </div>
      )}
    </div>
  );
};

export default StudentArticleList;
