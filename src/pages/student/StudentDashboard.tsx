// src/pages/student/StudentDashboard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useStudentArticles } from '../../hooks/useStudentArticles';
import { useStudentProgress } from '../../hooks/useStudentProgress';
import StudentStats from '../../components/student/StudentStats';
import RecentActivity from '../../components/student/RecentActivity';
import StudentArticleCard from '../../components/student/StudentArticleCard';
import {LoadingSpinner} from '../../components/common/LoadingSpinner';
import type { IArticle } from '../../types/article.types';


const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { data: articles, isLoading: articlesLoading } = useStudentArticles();
  
  const { data: progressData, isLoading: progressLoading } = useStudentProgress();

  if (articlesLoading || progressLoading) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  // Filter articles by status
  const readyArticles = articles?.filter((article:IArticle) => article.status === 'ready') || [];
  const recentArticles = readyArticles.slice(0, 3); // Show 3 most recent
  
  const hasArticles = readyArticles.length > 0;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back{user?.fullname ? `, ${user.fullname.split(' ')[0]}` : ''}!
        </h1>
        <p className="text-gray-600">
          Ready to practice your listening and typing skills?
        </p>
      </div>

      {/* Quick Stats */}
      <StudentStats progressData={progressData} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Continue Practice Section */}
          {hasArticles && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Continue Practicing
                </h2>
                <Link 
                  to="/student/articles" 
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View all articles →
                </Link>
              </div>
              
              {recentArticles.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-4">📚</div>
                  <p className="text-gray-600">No articles available yet.</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Check back later for new exercises!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {recentArticles.map((article:IArticle) => (
                    <StudentArticleCard
                      key={article.articleName}
                      article={article}
                      progress={progressData?.articleProgress?.[article.articleName]}
                      showQuickStart={true}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Recent Activity */}
          <RecentActivity progressData={progressData} />
        </div>

        {/* Right Column - Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/student/articles"
                className="block w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
              >
                📖 Browse Articles
              </Link>
              
              {progressData?.lastPracticed && (
                <Link
                  to={`/student/practice/${progressData.lastPracticed.articleName}`}
                  className="block w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center font-medium"
                >
                  🔄 Continue Last Session
                </Link>
              )}
              
              <button className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                📊 View Progress Report
              </button>
            </div>
          </div>

          {/* Tips Section */}
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Practice Tips</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Start with easier articles (A1-A2 level)</li>
              <li>• Use headphones for better audio quality</li>
              <li>• Practice regularly for best results</li>
              <li>• Don't worry about perfect scores initially</li>
            </ul>
          </div>
        </div>
      </div>

      {/* No Articles State */}
      {!hasArticles && (
        <div className="text-center py-12 bg-white rounded-lg border">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Practice Articles Available
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Your teachers haven't published any dictation exercises yet. 
            Check back later or contact your instructor.
          </p>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;