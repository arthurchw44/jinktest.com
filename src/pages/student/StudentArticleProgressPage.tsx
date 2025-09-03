import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useArticle } from '../../hooks/useArticles';
import { useStudentArticleProgress } from '../../hooks/useStudentProgress';
import {LoadingSpinner} from '../../components/common/LoadingSpinner';

interface ProgressOverviewCardProps {
  progress: {
    totalAttempts: number;
    bestScore: number;
    completionRate: number;
    lastPracticed: Date;
    averageScore: number;
    totalTimeSpent: number;
  };
  articleTitle: string;
}

const ProgressOverviewCard: React.FC<ProgressOverviewCardProps> = ({ progress, articleTitle }) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getScoreColor = (score: number): string => {
    if (score >= 0.9) return 'text-green-600 bg-green-100';
    if (score >= 0.7) return 'text-yellow-600 bg-yellow-100';
    if (score >= 0.5) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getCompletionColor = (rate: number): string => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{articleTitle}</h1>
          <p className="text-gray-600">Progress Overview</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(progress.bestScore)}`}>
          Best Score: {Math.round(progress.bestScore * 100)}%
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {progress.totalAttempts}
          </div>
          <div className="text-sm text-gray-600">Total Attempts</div>
        </div>

        <div className="text-center">
          <div className={`text-2xl font-bold ${getCompletionColor(progress.completionRate)}`}>
            {progress.completionRate}%
          </div>
          <div className="text-sm text-gray-600">Completion Rate</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {Math.round(progress.averageScore * 100)}%
          </div>
          <div className="text-sm text-gray-600">Average Score</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {formatTime(progress.totalTimeSpent)}
          </div>
          <div className="text-sm text-gray-600">Total Time</div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t">
        <p className="text-sm text-gray-600">
          Last practiced: {progress.lastPracticed.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>
    </div>
  );
};

interface FragmentBreakdownProps {
  fragments: Array<{
    fragmentIndex: number;
    text: string;
    attempts: number;
    bestScore: number;
    averageScore: number;
    status: 'pending' | 'correct' | 'given-up';
  }>;
}

const FragmentBreakdown: React.FC<FragmentBreakdownProps> = ({ fragments }) => {
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'correct': return 'bg-green-100 text-green-800';
      case 'given-up': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'correct': return '✓';
      case 'given-up': return '⚠';
      case 'pending': return '○';
      default: return '○';
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 0.9) return 'text-green-600';
    if (score >= 0.7) return 'text-yellow-600';
    if (score >= 0.5) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Fragment Performance</h2>
      
      <div className="space-y-3">
        {fragments.map((fragment) => (
          <div
            key={fragment.fragmentIndex}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-medium ${getStatusColor(fragment.status)}`}>
                  {getStatusIcon(fragment.status)}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  Fragment {fragment.fragmentIndex + 1}
                </span>
                <span className={`text-sm font-semibold ${getScoreColor(fragment.bestScore)}`}>
                  {Math.round(fragment.bestScore * 100)}%
                </span>
              </div>
              <p className="text-sm text-gray-800 truncate" title={fragment.text}>
                {fragment.text}
              </p>
            </div>
            
            <div className="ml-4 text-right">
              <div className="text-xs text-gray-500">
                {fragment.attempts} attempt{fragment.attempts !== 1 ? 's' : ''}
              </div>
              <div className="text-xs text-gray-500">
                Avg: {Math.round(fragment.averageScore * 100)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const BasicAttemptTimeline: React.FC<{ attempts: Array<{ date: Date; score: number; }> }> = ({ attempts }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Attempts</h2>
      
      <div className="space-y-3">
        {attempts.slice(0, 5).map((attempt, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span className="text-sm text-gray-600">
                {attempt.date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <span className={`text-sm font-medium ${
              attempt.score >= 0.8 ? 'text-green-600' : 
              attempt.score >= 0.6 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {Math.round(attempt.score * 100)}%
            </span>
          </div>
        ))}
      </div>
      
      {attempts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No practice attempts yet</p>
        </div>
      )}
    </div>
  );
};

const DetailedHistoryPlaceholder: React.FC = () => {
  return (
    <div className="relative bg-white rounded-lg shadow-sm border p-6 opacity-60">
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg">
          <span className="text-sm font-medium">Detailed History Coming Soon</span>
        </div>
      </div>
      
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Detailed Session History</h2>
      
      {/* Placeholder content */}
      <div className="space-y-4">
        <div className="h-24 bg-gray-100 rounded animate-pulse"></div>
        <div className="h-24 bg-gray-100 rounded animate-pulse"></div>
        <div className="h-24 bg-gray-100 rounded animate-pulse"></div>
      </div>
    </div>
  );
};

const StudentArticleProgressPage: React.FC = () => {
  const { articleName } = useParams<{ articleName: string }>();
  const navigate = useNavigate();
  
  const { data: article, isLoading: articleLoading, error: articleError } = useArticle(articleName!);
  const { data: progress, isLoading: progressLoading, error: progressError } = useStudentArticleProgress(articleName!);

  if (articleLoading || progressLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner message="Loading progress..." />
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
            to="/student/articles" 
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Articles
          </Link>
        </div>
      </div>
    );
  }

  if (progressError || !progress) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Progress Data</h2>
          <p className="text-gray-600 mb-4">You haven't practiced this article yet.</p>
          <Link 
            to={`/student/practice/${articleName}`}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors mr-3"
          >
            Start Practice
          </Link>
          <Link 
            to="/student/articles" 
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            Back to Articles
          </Link>
        </div>
      </div>
    );
  }

  // Mock fragment data based on article sentences and progress
  const fragmentData = article.sentences.map((sentence, index) => ({
    fragmentIndex: index,
    text: sentence.text,
    attempts: Math.floor(Math.random() * 5) + 1, // Mock data
    bestScore: Math.random() * 0.5 + 0.5, // Mock data: 50-100%
    averageScore: Math.random() * 0.4 + 0.4, // Mock data: 40-80%
    status: Math.random() > 0.7 ? 'correct' : Math.random() > 0.5 ? 'given-up' : 'pending' as 'pending' | 'correct' | 'given-up'
  }));

  // Mock recent attempts
  const recentAttempts = Array.from({ length: Math.min(progress.totalAttempts, 5) }, (_, i) => ({
    date: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)), // Last 5 days
    score: Math.random() * 0.5 + 0.5
  })).reverse();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link to="/student/articles" className="hover:text-gray-700">Articles</Link>
          <span>›</span>
          <span className="text-gray-900">{article.title}</span>
          <span>›</span>
          <span className="text-gray-900">Progress</span>
        </nav>

        <div className="space-y-6">
          {/* Progress Overview */}
          <ProgressOverviewCard 
            progress={progress} 
            articleTitle={article.title}
          />

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Link
              to={`/student/practice/${articleName}`}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
            >
              Practice Again
            </Link>
            <button
              onClick={() => navigate('/student/articles')}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold transition-colors"
            >
              Back to Articles
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fragment Breakdown */}
            <FragmentBreakdown fragments={fragmentData} />

            {/* Recent Attempts Timeline */}
            <BasicAttemptTimeline attempts={recentAttempts} />
          </div>

          {/* Detailed History Placeholder */}
          <DetailedHistoryPlaceholder />
        </div>
      </div>
    </div>
  );
};

export default StudentArticleProgressPage;
