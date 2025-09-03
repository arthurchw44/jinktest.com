import React from 'react';
import { useStudentProgress } from '../../hooks/useStudentProgress';
import { useStudentArticles } from '../../hooks/useStudentArticles';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';
import type { IArticle } from '../../types/article.types';
import StudentArticleCard from '../../components/student/StudentArticleCard';
// import type { ArticleProgress } from '../../types/progress.types';

const StudentDashboard: React.FC = () => {
  const { data: progress, isLoading: progressLoading, error: progressError } = useStudentProgress();
  const { data: articles, isLoading: articlesLoading, error: articlesError } = useStudentArticles();

  // Loading state
  if (progressLoading || articlesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner message="Loading your progress..." size="large" />
      </div>
    );
  }

  // Error state with fallback
  if (progressError && !progress) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Unable to Load Progress</h2>
          <p className="text-gray-600 mb-4">We couldn't load your progress data. Please try refreshing the page.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  const formatPercentage = (value: number) => Math.round(value * 100);
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Learning Dashboard</h1>
          <p className="text-gray-600 mt-2">Track your dictation practice progress</p>
          
          {/* Data source indicator */}
          <div className="mt-2 text-xs text-gray-500">
            {progressError ? (
              <span className="flex items-center">
                <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                Using offline data
              </span>
            ) : (
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Synced with server
              </span>
            )}
          </div>
        </div>

        {/* Progress Overview */}
        {progress && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Articles Attempted */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-semibold text-gray-900">{progress.totalArticlesAttempted}</p>
                  <p className="text-sm text-gray-600">Articles Practiced</p>
                </div>
              </div>
            </div>

            {/* Completion Rate */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-semibold text-gray-900">{progress.completedArticles}</p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
              </div>
            </div>

            {/* Average Score */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-semibold text-gray-900">{formatPercentage(progress.averageScore)}%</p>
                  <p className="text-sm text-gray-600">Average Score</p>
                </div>
              </div>
            </div>

            {/* Time Spent */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-semibold text-gray-900">{formatTime(progress.totalTimeSpent)}</p>
                  <p className="text-sm text-gray-600">Time Practiced</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Sessions */}
          {progress && progress.recentSessions.length > 0 && (
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Practice Sessions</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {progress.recentSessions.map((session, index) => (
                    <div key={index} className="p-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{session.articleName}</h4>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                            <span>Score: {formatPercentage(session.score)}%</span>
                            <span>Completion: {Math.round(session.completionRate)}%</span>
                            <span>{new Date(session.timestamp).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Link
                          to={`/student/practice/${session.articleName}`}
                          className="ml-4 px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                        >
                          Practice Again
                        </Link>

<Link to={`/student/progress/${session.articleName}`} 
className="ml-2 px-3 py-1 border border-indigo-300 text-indigo-700 rounded-md text-sm hover:bg-indigo-50" >View Progress 
</Link>

                        
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Available Articles */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Available Articles</h3>
              </div>
              <div className="p-6">
                {articlesLoading ? (
                  <LoadingSpinner message="Loading articles..." size="small" />
                ) : articlesError ? (
                  <p className="text-red-600 text-sm">Failed to load articles</p>
                ) : articles && articles.length > 0 ? (
                  <div className="space-y-3">

{articles.slice(0, 5).map((article: IArticle) => (
  <StudentArticleCard
    key={article.articleName}
    article={article}
    // per-article progress not available in `progress`
    showQuickStart={true}
  />
))}

                    
                    
                    {articles.length > 5 && (
                      <Link
                        to="/student/articles"
                        className="block text-center py-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View all {articles.length} articles →
                      </Link>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm">No articles available</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {progress && progress.totalArticlesAttempted === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Start Your First Practice Session</h3>
            <p className="text-gray-600 mb-4">Choose an article to begin practicing dictation</p>
            <Link
              to="/student/articles"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Browse Articles
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
